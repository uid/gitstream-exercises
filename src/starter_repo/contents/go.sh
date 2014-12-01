repo="$(git config remote.origin.url)"
baseUrl=${repo%%/repos*}
anglerUrl="$baseUrl/hooks"

git config angler.url "$anglerUrl"
gitroot="$(git rev-parse --show-toplevel)"

curl -H "X-GitStream-Repo: $repo" "$baseUrl/go"

rm "$gitroot"/.git/hooks/*
git reset --hard HEAD > /dev/null 2>&1
git clean -df > /dev/null 2>&1
git fetch origin > /dev/null 2>&1
git reset --hard origin/master > /dev/null 2>&1
git log --oneline --color --graph --decorate --all
cp "$gitroot"/.gitstream/hooks/* "$gitroot"/.git/hooks/
echo "GitStream: Follow the instructions in your browser!"
