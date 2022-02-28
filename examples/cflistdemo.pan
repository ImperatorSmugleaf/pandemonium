$ The basics of control flow and list manipulation!

proc main([string] args) {
    set favoriteNumbers: [num] = [3, 4, 5, 7];
    for (number in favoriteNumbers) {
        print("#{number} is a great number!");
    }
    
    now oneThroughSeven: [num] = [1, 2, <-favoriteNumbers];         $ [1, 2, 3, 4, 5, 7]
    oneThroughSeven.insertAt(5, 6);                                 $ [1, 2, 3, 4, 5, 6, 7]
    
    for(i: num = 0; i < 7; i++) {
        oneThroughSeven[i] = oneThroughSeven[i] * 2;
    }
    
    while(oneThroughSeven.length > 0) {
        set lastValue: num = oneThroughSeven.pop();
        if(lastValue in favoriteNumbers) {
            print("I'm keeping this one...");
            oneThroughSeven.preadd(lastValue);
        }
        if(oneThroughSeven C< favoriteNumbers) {                    $ Proper subset operator, only functional on lists.
            nope;                                                   $ "Break" statement equivalent
        }
    }
    
}