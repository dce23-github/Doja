 
#!/bin/bash
lang=$1
solution=$7
testcase=$8
solrun=$9
RTE=0
CE=0
# memArr=(3500 7500 95000 19000)
initMem=0
if [[ $lang = "c" ]]
then {
        # initMem=${memArr[0]}
        gcc -o $9 $7 &> $2 && {
            {
                cat $8 | /usr/bin/time -f "%e %M" -o $3 timeout $4s ./$9 &> $2
            } || {
                RTE=1
            }
        }
    } || {
        CE=1
    }
elif [[ $lang = "cpp" ]]
then {
        
        
    #    g++ -o $9 $7 &> $2 && {
            {
                cat $8 | /usr/bin/time -f "%e %M" -o $3 timeout $4s ./$9 &> $2
            } || {
                RTE=1
            }
        }
    } || {
        CE=1
    }
elif [[ $lang = "java" ]]
then {
        # initMem=${memArr[2]}
        javac $7 &> $2 && {
            {
                cat $8 | /usr/bin/time -f "%e %M" -o $3 timeout $4s java $9 &> $2
            } || {
                RTE=1
            }
        }
    } || {
        CE=1
    }
elif [[ $lang = "py" ]]
then {
        # initMem=${memArr[3]}
        cat $8 | /usr/bin/time -f "%e %M" -o $3 timeout $4s python3 $7 &> $2
    } || {
        RTE=1
    }
fi


if [[ $CE -ne 1 ]]
then
    arr=`cat $3`
    arr=(${arr// / })

    if [ ${arr[0]} = "Command" ]
    then
        arr=`cat $3 | head -n 2 | tail -n 1`
        arr=(${arr// / })
    fi

    time=${arr[0]}
    memory=${arr[1]}

    time=$(bc -l <<<"${time}*1000")

#     memory=$(bc -l <<<"(${memory})-(${initMem})")


    timeDiff=$(bc -l <<<"($4*1000)-${time}")
    memDiff=$(bc -l <<<"($5*1000)-(${memory}/1)")
    if [[ $(echo "$timeDiff <= 0" | bc -l) -eq 1 ]]
    then
        echo "TLE" >> $2
        echo "TLE" > $6

    elif [[ $(echo "$memDiff <= 0" | bc -l) -eq 1 ]]
    then
        echo "MLE" >> $2
        echo "MLE" > $6
    else
        echo "valid" >$6
    fi
fi

if [[ $CE -eq 1 ]]
then
    echo "COMPILATION ERROR" >> $2
    echo "CE" >> $6
fi

if [[ $RTE -eq 1 ]]
then
    echo "RUNTIME ERROR" >> $2
    echo "RE" >> $6
fi


# echo -e "\nTime : $time" >> $3
# echo $memory >> $3
