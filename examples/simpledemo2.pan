$ Another simple demonstration program

set oneThroughFive: [num] = [1, 2, 3, 4, 5];
set counting: bool = true;

proc main([string] args) {
    now count: num = 0;
    while(counting) {
        print(oneThroughTen[count]);
        count++;
        --count;
        nope;
    }

    count += 10;
    count -= 5;
    count = cube(count);
    count = !(124.623E-12) || ((2 < 4) == false && 6++ + 12 * 10 ^ ++0 );	$ Syntax error: expression is boolean, but variable is num
    print(oneThroughFive.pop());
    success();
}

num cube(num x) {
    set triple: num = x * x * x;
    yeet triple;
}