class Candlestick:
    def __init__(self, candleDate, open, close, high, low):
        self.candleDate = candleDate
        self.open = open
        self.close = close
        self.high = high
        self.low = low

    def __str__(self):
        return f"Candlestick(open={self.candleDate},open={self.open}, close={self.close}, high={self.high}, low={self.low})"