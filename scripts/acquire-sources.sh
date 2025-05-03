#!/usr/bin/env bash

# This script visits all the sources in the sources.yaml file,
# downloads them, and saves them to the data directory.
# It is intended to be run from the root of the repository.

function usage {
  echo "Usage: $0 -o <output_dir> -s <sources.yaml> -c <clobber> -d <dry_run> -v <verbose>"
  echo "  -o <output_dir>   The directory to save the downloaded sources to."
  echo "  -s <sources.yaml> The sources.yaml file to read from."
  echo "  -c                Whether to overwrite existing files (default: false)."
  echo "  -d                Whether to perform a dry run (only checks URLs) (default: false)."
  echo "  -v                Enable verbose output."
  echo "  -h                Show this help message."
}

set -euo pipefail
IFS=$'\n\t'

# Default values
output_dir="src/crds"
sources_file="sources.yaml"
dry_run=false
clobber=false
verbose=false

function log {
  local force
  force=${2:-false}

  if $verbose || $force; then
    echo "$(date +'%Y-%m-%d %H:%M:%S') - $1" >&2
  fi
}

function download_source {
  local url output_dir filename output_file clobber dry_run

  url="$1"
  output_dir="$2"
  filename="$(basename "$url" | sha256sum | cut -d' ' -f1)"
  output_file="$output_dir/$filename.yaml"
  clobber="$3"
  dry_run="$4"

  if $dry_run; then
    if ! curl -sL --head "$url" >/dev/null; then
      log "URL $url is not reachable."
      return 1
    else
      log "URL $url is reachable."
      return 0
    fi
  fi

  if [[ ! -d "$output_dir" ]]; then
    mkdir -p "$output_dir"
  fi

  if [[ -f "$output_file" && "$clobber" != "true" ]]; then
    log "File $output_file already exists. Skipping download."
    return 0
  fi

  log "Downloading $url to $output_file..."
  if ! curl -sL "$url" -o "$output_file"; then
    log "Failed to download $url"
    return 1
  fi
}

while getopts ":o:s:c:d:v:h" opt; do
  case $opt in
  o) output_dir="$OPTARG" ;;
  s) sources_file="$OPTARG" ;;
  c) clobber=true ;;
  d) dry_run=true ;;
  v) verbose=true ;;
  h)
    usage
    exit 0
    ;;
  \?)
    log "Invalid option: -$OPTARG" true
    usage
    exit 1
    ;;
  :)
    log "Option -$OPTARG requires an argument." true
    usage
    exit 1
    ;;
  esac
done

if [[ ! -f "$sources_file" ]]; then
  log "File $sources_file not found!"
  exit 1
fi

undownloadable=()
downloadable=()
while IFS= read -r line; do
  if ! download_source "$line" "$output_dir" "$clobber" "$dry_run"; then
    undownloadable+=("$line")
  fi
  downloadable+=("$line")
done < <(yq '.sources[]' "$sources_file")

if [[ ${#undownloadable[@]} -gt 0 ]]; then
  log "The following sources could not be downloaded:" true
  for source in "${undownloadable[@]}"; do
    log "$source" true
  done
  exit 1
elif [[ ${#downloadable[@]} -gt 0 ]]; then
  log "Successfully downloaded ${#downloadable[@]} sources." true
else
  log "No sources were found to download." true
fi
