from transformers import GPT2LMHeadModel, GPT2Tokenizer

# Carregando o tokenizer GPT-2
tokenizer = GPT2Tokenizer.from_pretrained('gpt2')

# Carregando o modelo GPT-2 pré-treinado
model = GPT2LMHeadModel.from_pretrained('gpt2')

# Gerando texto a partir de uma entrada do usuário
input_text = "Hello, how are you?"
input_ids = tokenizer.encode(input_text, return_tensors='pt')
generated_text = model.generate(input_ids, max_length=1000, do_sample=True)

# Decodificando o texto gerado
decoded_text = tokenizer.decode(generated_text[0], skip_special_tokens=True)
print(decoded_text)
