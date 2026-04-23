from fastapi import FastAPI
from fastapi.middleware.cors import  CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*",]
)
#Temp DB
transactions =[]

@app.get("/")
def home():
    return{"message":"API is working"}
# Add Transaction 
@app.post("/add")
def add_transaction(t:dict):
    transactions.append(t)
    return {"Message":"added"}

@app.get("/transactions")
def get_transactions():
    return transactions

#Delet transaction
@app.delete("/delete/{id}")
def delete_transaction(id:int):
    global transactions
    transactions = [t for t in transactions if t["id"] != id]
    return {"Message":"Deleted"}

