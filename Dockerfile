FROM node:10.6.0-stretch

COPY . /examples
WORKDIR /examples

ENV LANG en_US.UTF-8

RUN set -ex && \
    buildDeps=' \
      liblldb-4.0-dev \
    ' && \
    runtimeDeps=' \
      zsh \
      vim \
      linux-tools \
      lldb-4.0 \
      tmux \
      locales \
      gdb \
    ' && \
    tmuxConfig=' \
      set-option -g default-shell /bin/zsh \n\
      set -g mouse \n\
    ' && \
    vimConfig=' \
      set background=dark \n\
      set number \n\
      set ts=2 \n\
      set sw=2 \n\
      set expandtab \n\
      set nowrap \n\
    ' && \
    apt-get update && \
    apt-get install -y $runtimeDeps $buildDeps && \
    rm -rf /var/lib/apt/lists/* && \
    echo "$tmuxConfig" >> /etc/tmux.conf && \
    echo "$vimConfig" >> /root/.vimrc && \
    sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8 && \
    npm ci && \
    mkdir out
RUN wget https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh -O - | zsh || true

CMD /bin/zsh
