import yfinance as yf
import talib
import matplotlib.pyplot as plt
import pandas as pd
from Stock import Stock
from Candlestick import Candlestick


stock = yf.Ticker("PLTR")
hist_data = stock.history(period="1mo", interval="1d")
stock_pltr = Stock("Palantir", "PLTR")
print(stock_pltr)
stock_pltr.set_candlesticklist(hist_data)


"""
# Obtenha os dados históricos da ação da Apple
msft = yf.Ticker("TSLA")
hist_data = msft.history(period="1mo")
print(hist_data.head())
print(hist_data.tail())
print(hist_data.iloc[0])  # primeira linha do DataFrame
print(hist_data.iloc[-1])  # última linha do DataFrame




# Obtenha os dados históricos da ação da Apple
stock = yf.Ticker("PLTR")
hist_data = stock.history(period="1mo")



# Calcular o padrão Engulfing
engulfing = talib.CDLENGULFING(hist_data['Open'], hist_data['High'], hist_data['Low'], hist_data['Close'])

print("engulfing")
# Exibir os resultados
print(engulfing)
print(hist_data['Close'])
print(talib.SMA(hist_data['Close']))




# Gerando alguns dados de exemplo
close_prices = [10, 12, 15, 14, 13, 16, 18, 20, 19, 17]

# Calculando a média móvel simples de 20 períodos usando TALib
sma_20 = talib.SMA(pd.Series(close_prices), timeperiod=20)

# Criando um gráfico usando Matplotlib
plt.plot(close_prices, label='Preços de fechamento')
plt.plot(sma_20, label='Média móvel simples de 20 períodos')
plt.legend()
plt.show()
"""