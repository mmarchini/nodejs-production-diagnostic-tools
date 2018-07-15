FROM node:10.6.0-stretch

COPY . /examples

ENV LANG en_US.UTF-8

# RUN echo "deb http://httpredir.debian.org/debian/ jessie main non-free"
RUN apt-get update && apt-get install -y zsh vim linux-tools lldb-4.0 liblldb-4.0-dev tmux locales && \
    echo "set-option -g default-shell /bin/zsh" >> /etc/tmux.conf && \
    sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8 && \
    wget https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh -O - | zsh || true

WORKDIR /examples
CMD /bin/zsh
