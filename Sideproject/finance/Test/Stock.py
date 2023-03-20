from typing import List
import pandas as pd

class Stock:
    candleLst = []
    def __init__(self, name, designation):
        self.name = name
        self.designation = designation

    def get_name(self) -> str:
        return self.name

    def set_name(self, name: str):
        self._nome = name

    def get_designation(self) -> str:
        return self.designation

    def set_designation(self, designation: str):
        self.designation = designation

    def get_candlesticklist(self) -> pd.DataFrame:
        return self.candleLst

    def set_candlesticklist(self, candles: pd.DataFrame):
        self.candleLst.append(candles)

    def get_stock_value(self):
        return self.stock_value

    def set_stock_value(self, stock_value):
        self.stock_value = stock_value

    def get_stock_value_date(self):
        return self.stock_value

    def set_stock_value_date(self, stock_value_date):
        self.stock_value_date = stock_value_date

    stock_value = property(get_stock_value, set_stock_value)
    stock_value_date = property(get_stock_value_date, set_stock_value_date)

    def __str__(self):
        return f"Stock(name={self.name}, designation={self.designation})"