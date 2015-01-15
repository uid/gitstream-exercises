repo="$(git config remote.origin.url)"
baseUrl=${repo%%/repos*}
anglerUrl="$baseUrl/hooks"

git config angler.url "$anglerUrl"
gitroot="$(git rev-parse --show-toplevel)"

curl -H "X-GitStream-Repo: $repo" "$baseUrl/go"

rm "$gitroot"/.git/hooks/*
git remote | grep -v "^origin$" | xargs -rL 1 git remote remove
git remote prune origin > /dev/null 2>&1
git show-ref --tags --heads | grep -v "/master$" | cut -d" " -f 2 | xargs -rL 1 git update-ref -d > /dev/null 2>&1
git checkout -f master > /dev/null 2>&1
git reset --hard HEAD > /dev/null 2>&1
git clean -df > /dev/null 2>&1
git fetch origin > /dev/null 2>&1
git reset --hard origin/master > /dev/null 2>&1
git reflog expire --expire=now --all > /dev/null 2>&1
git gc --prune=now > /dev/null 2>&1
"$gitroot"/.gitstream/setup.sh > /dev/null 2>&1
cp "$gitroot"/.gitstream/hooks/* "$gitroot"/.git/hooks/
git log --oneline --color --graph --decorate --all
echo "GitStream: Follow the instructions in your browser!"
