FROM node:10.6.0-stretch

COPY . /examples

RUN apt update && apt install zsh vim

WORKDIR /examples
CMD /bin/bash
