param (
    [Parameter(Mandatory=$true)][string]$tag
)

az acr login --name identiverse
docker build --rm -f "Dockerfile" -t identiverse.azurecr.io/identiverse-demo-university:$tag .
docker push identiverse.azurecr.io/identiverse-demo-university:$tag