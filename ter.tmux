#!/bin/bash
SESSION="isroproject"
tmux new-session -d -s $SESSION
tmux rename-window -t $SESSION:0 'isro'
tmux send-keys -t $SESSION:0 'npm run dev' C-m
tmux split-window -h -t $SESSION:0
#tmux send-keys -t $SESSION:0.1 'cd zyvixrcs && npm run dev' C-m
tmux set-option -g mouse on
tmux attach -t $SESSION
