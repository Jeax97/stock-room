#!/bin/bash
echo ""
echo "  ===================================="
echo "    Stock-Room — Gestione Magazzino"
echo "  ===================================="
echo ""

# Controlla se Docker è in esecuzione
if ! docker info > /dev/null 2>&1; then
    echo "  [ERRORE] Docker non è in esecuzione!"
    echo "  Avvia Docker e riprova."
    echo ""
    exit 1
fi

echo "  Avvio in corso... (la prima volta ci vogliono alcuni minuti)"
echo ""

docker compose up --build -d

if [ $? -ne 0 ]; then
    echo ""
    echo "  [ERRORE] Qualcosa è andato storto. Controlla i log con:"
    echo "  docker compose logs"
    echo ""
    exit 1
fi

echo ""
echo "  ===================================="
echo "    Stock-Room avviato con successo!"
echo "  ===================================="
echo ""
echo "  Apri il browser su: http://localhost"
echo ""
echo "  Per fermare: ./stop.sh"
echo ""
