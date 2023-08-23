ARG BASE_IMAGE
FROM $BASE_IMAGE

USER app
WORKDIR /app

COPY --chown=app:app . .

RUN npm run build && \
    rm -rf ~/.npm ~/.git-credentials

EXPOSE 9924
CMD [ "npm", "run", "start:prod" ]
# CMD [ "node", "./dist/main.js" ]
