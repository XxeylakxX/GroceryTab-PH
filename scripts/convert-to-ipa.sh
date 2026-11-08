#!/usr/bin/env bash
set -euo pipefail

# Sideloading IPA Converter Script
# Converts an EAS unsigned .tar.gz archive into a valid installable .ipa

ARCHIVE_FILE="${1:-}"
OUTPUT_IPA="${2:-GroceryTabPH.ipa}"

if [[ -z "$ARCHIVE_FILE" ]]; then
  ARCHIVE_FILE=$(ls *.tar.gz 2>/dev/null | head -n 1 || true)
  if [[ -z "$ARCHIVE_FILE" ]]; then
    echo "Error: No .tar.gz file found in current directory. Usage: ./convert-to-ipa.sh <archive.tar.gz> [output.ipa]"
    exit 1
  fi
  echo "==> Auto-detected archive: $ARCHIVE_FILE"
fi

WORKDIR="./temp_ipa_work"
rm -rf "$WORKDIR"
mkdir -p "$WORKDIR"

echo "==> Step 1: Extracting $ARCHIVE_FILE..."
tar -xzf "$ARCHIVE_FILE" -C "$WORKDIR"

# Locate .app bundle
APP_BUNDLE=$(find "$WORKDIR" -type d -name "*.app" | head -n 1)
if [[ -z "$APP_BUNDLE" ]]; then
  echo "Error: No .app bundle found inside the extracted archive."
  exit 1
fi
APP_NAME=$(basename "$APP_BUNDLE")
echo "==> Found native app bundle: $APP_NAME"

echo "==> Step 2: Creating Payload directory..."
mkdir -p "$WORKDIR/Payload"
cp -R "$APP_BUNDLE" "$WORKDIR/Payload/"

echo "==> Step 3: Compressing into .ipa..."
cd "$WORKDIR"
zip -qry "../$OUTPUT_IPA" Payload
cd ..

rm -rf "$WORKDIR"

echo "==> Step 4: Sanity check..."
if unzip -l "$OUTPUT_IPA" | grep -q "Payload/$APP_NAME/Info.plist"; then
  echo "=========================================================="
  echo " [SUCCESS] $OUTPUT_IPA is valid and ready!"
  echo " Verified root structure: Payload/$APP_NAME"
  echo " You can now drag and drop this into Sideloadly or TrollStore."
  echo "=========================================================="
else
  echo "Warning: Verification check failed. Please inspect $OUTPUT_IPA."
fi
