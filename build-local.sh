#!/bin/sh

[ -f ../build-local.env ] && . ../build-local.env
[ -f ./build-local.env ] && . ./build-local.env

IMAGE_TAG=$(basename $(pwd)):local

docker build \
    --network=host \
    --build-arg BASE_IMAGE="$BASE_IMAGE" \
    --build-arg http_proxy="$http_proxy" \
    --build-arg https_proxy="$https_proxy" \
    -t "$IMAGE_TAG" .
