start /d "%cd%" cmd /k "git status & timeout 2 & git stash & timeout 2 & npm run upgrade & timeout 3 & exit"