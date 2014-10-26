repo="$(git config remote.origin.url)"
baseUrl=${repo%%/repos*}
anglerUrl="$baseUrl/hooks"

git config angler.url "$anglerUrl"
gitroot="$(git rev-parse --show-toplevel)"
cp "$gitroot"/.gitstream/hooks/* "$gitroot"/.git/hooks/

curl -H "X-GitStream-Repo: $repo" "$baseUrl/go"

git pull > /dev/null 2>&1
git checkout origin/master > /dev/null 2>&1
git branch -f master > /dev/null 2>&1
git checkout master > /dev/null 2>&1
git clean -df > /dev/null 2>&1
git checkout :/ > /dev/null 2>&1
git log --oneline --color --graph --decorate --all
