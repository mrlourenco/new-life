import sqlite3

from model.TipoInvestimento import TipoInvestimento


def conectar():
    return sqlite3.connect("D:\\Dev\\Database\\financas.db")


def inserir_tipo_investimento(conexao, tipoInv:TipoInvestimento):
    cursor = conexao.cursor()

    cursor.execute("INSERT INTO TIPO_INVESTIMENTO (DESCRICAO_ABR, DESCRICAO) VALUES(?, ?);", (tipoInv.getDescricaoAbr(), tipoInv.getDescricao()))
    conexao.commit()


def main():
    conexao = conectar()
    tipo = TipoInvestimento("A", "B")
    # Inserir produtos
    inserir_tipo_investimento(conexao, tipo)

    conexao.close()

if __name__ == "__main__":
    main()
