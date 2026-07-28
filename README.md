# SafeWithdraw – USSD + SMS Simulator

Simulador do fluxo SafeWithdraw para Africa's Talking (Sandbox).

## Fluxo implementado

1. Utilizador marca: `*XXX*NUMERO*VALOR#`
2. Sistema pede o PIN
3. Processa (verifica saldo simulado)
4. Gera token de 4 caracteres
5. Envia SMS de confirmação (aparece na Inbox do Sandbox)

## Código USSD actual

`*384*40719#`
