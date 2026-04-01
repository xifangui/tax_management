from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.db import get_session
from app.core.dependencies import get_current_active_user
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerRead, CustomerUpdate

router = APIRouter()

@router.get("/", response_model=List[CustomerRead])
def list_customers(current_user=Depends(get_current_active_user), session: Session = Depends(get_session)):
    statement = select(Customer).where(Customer.status == "ACTIVE")
    results = session.exec(statement).all()
    return results

@router.get("/{customer_id}", response_model=CustomerRead)
def get_customer(customer_id: int, current_user=Depends(get_current_active_user), session: Session = Depends(get_session)):
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return customer

@router.post("/", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
def create_customer(customer_in: CustomerCreate, current_user=Depends(get_current_active_user), session: Session = Depends(get_session)):
    customer = Customer(**customer_in.dict())
    session.add(customer)
    session.commit()
    session.refresh(customer)
    return customer

@router.put("/{customer_id}", response_model=CustomerRead)
def update_customer(customer_id: int, customer_in: CustomerUpdate, current_user=Depends(get_current_active_user), session: Session = Depends(get_session)):
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    customer_data = customer_in.dict(exclude_unset=True)
    for field, value in customer_data.items():
        setattr(customer, field, value)
    session.add(customer)
    session.commit()
    session.refresh(customer)
    return customer

@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, current_user=Depends(get_current_active_user), session: Session = Depends(get_session)):
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    customer.status = "INACTIVE"
    session.add(customer)
    session.commit()
    return None
