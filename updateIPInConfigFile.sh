myIP=`ifconfig | grep "inet 10.230" | sed -e "s/^.*inet \(10\.230\.[0-9\.]*\).*$/\1/"`
sed -i '.bak' "s/\"host\":[ ]\"[^5][0-9\.]*\"/\"host\": \"$myIP\"/" app/conf/config.json 
echo "myIP: ${myIP}"
