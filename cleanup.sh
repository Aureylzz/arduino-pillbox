#!/usr/bin/env bash
#
# cleanup.sh
# ---------------------------
# Script de nettoyage pour:
# - Dossiers __pycache__
# - Fichiers :Zone.Identifier (Windows)
# - Dossier venv/
#
# Usage: bash cleanup.sh
#

echo "Suppression des dossiers __pycache__..."
find . -type d -name "__pycache__" -exec rm -rf {} +

echo "Suppression des fichiers :Zone.Identifier..."
find . -type f -name "*:Zone.Identifier" -exec rm -f {} +

echo "Suppression de l'environnement virtuel venv/..."
rm -rf venv

echo "Nettoyage terminé !"
