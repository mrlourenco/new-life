
# Pedido de Configuração de Servidor para Deploy de Kafka via GitLab CI/CD

Olá equipa,

Para configurar corretamente um servidor Linux para a instalação e gestão do Kafka via GitLab CI/CD com Ansible, preciso da vossa ajuda com os seguintes passos:

---

## 1. Criar Utilizadores

- `deploy`: utilizado pelo pipeline para aceder via SSH e executar tarefas.
- `kafka`: utilizado exclusivamente para correr a aplicação Kafka.

```bash
useradd -m -s /bin/bash deploy
useradd -m -s /bin/bash kafka
```

---

## 2. Adicionar `deploy` ao grupo `kafka` (opcional, mas recomendado)

```bash
usermod -aG kafka deploy
```

---

## 3. Criar diretório para Kafka e atribuir permissões

```bash
mkdir -p /opt/kafka
chown -R kafka:kafka /opt/kafka
```

---

## 4. Configurar acesso SSH para o utilizador `deploy`

- Criar diretório `.ssh` (se não existir):

```bash
mkdir -p /home/deploy/.ssh
```

- Adicionar a chave pública SSH ao ficheiro:

```bash
# Substituir pelo conteúdo real da chave pública gerada para o GitLab Runner
echo "ssh-rsa AAAA... gitlab-ci" > /home/deploy/.ssh/authorized_keys
```

- Definir as permissões corretas:

```bash
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
```

---

## 5. Criar o serviço `kafka.service` (systemd)

Criar o ficheiro `/etc/systemd/system/kafka.service` com o seguinte conteúdo:

```ini
[Unit]
Description=Apache Kafka
After=network.target

[Service]
Type=simple
User=kafka
ExecStart=/opt/kafka/bin/kafka-server-start.sh /opt/kafka/config/server.properties
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

---

## 6. Ativar o serviço Kafka

```bash
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable kafka.service
```

---

## 7. Permitir que o utilizador `deploy` possa gerir o serviço via sudo

No ficheiro sudoers (`visudo`), adicionar:

```bash
deploy ALL=NOPASSWD: /bin/systemctl start kafka.service, \
                     /bin/systemctl stop kafka.service, \
                     /bin/systemctl restart kafka.service, \
                     /bin/systemctl status kafka.service
```

---

## 8. Garantir conectividade

- Acesso por **SSH (porta 22)** ao utilizador `deploy`, a partir do GitLab Runner.
- (Opcional) Abrir as portas **9092** (Kafka) e **2181** (Zookeeper) se forem necessárias externamente.

---

Obrigado pela vossa ajuda!
