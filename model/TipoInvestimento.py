class TipoInvestimento:
    def __init__(self, descricaoAbr, descricao):
        self.descricaoAbr = descricaoAbr
        self.descricao = descricao
    def getDescricaoAbr(self):
        return self.descricaoAbr
    def getDescricao(self):
        return self.descricao