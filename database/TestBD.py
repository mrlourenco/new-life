import sqlite3

def main():
    # Conectar (ou criar) um arquivo de banco de dados SQLite chamado "exemplo.db"
    conexao = sqlite3.connect("D:\\Dev\\Database\\financas.db")

    # Criar um objeto cursor para executar comandos SQL
    cursor = conexao.cursor()

    # Criar uma tabela chamada "pessoas" com duas colunas: id (inteiro) e nome (texto)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pessoas (
        id INTEGER PRIMARY KEY,
        nome TEXT NOT NULL
    )
    """)

    # Inserir alguns dados na tabela "pessoas"
    cursor.execute("INSERT INTO pessoas (nome) VALUES (?)", ("Alice",))
    cursor.execute("INSERT INTO pessoas (nome) VALUES (?)", ("Bob",))

    # Salvar as alterações e fechar a conexão
    conexao.commit()
    conexao.close()

    # Reabrir a conexão para executar uma consulta
    conexao = sqlite3.connect("D:\\Dev\\Database\\financas.db")
    cursor = conexao.cursor()

    # Consultar todos os registros da tabela "pessoas"
    cursor.execute("SELECT * FROM pessoas")
    resultados = cursor.fetchall()

    # Imprimir os resultados da consulta
    print("Registros na tabela 'pessoas':")
    for linha in resultados:
        print(linha)

    # Fechar a conexão
    conexao.close()

if __name__ == "__main__":
    main()
