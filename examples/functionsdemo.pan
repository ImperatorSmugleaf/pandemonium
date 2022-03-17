$ Examples of what you can do with functions in pandemonium

proc main([string] args) {
    set roundBoi: Circle = Circle(5);
    print(roundBoi.area);
    print(isPalindrome("recursion"));
    print(isPalindrome("xyzzyx"));
}

struct Circle {
    init(num radius) {
        now this.radius: num = radius;
    }

    now area: num = () [this] -> {this.radius^2};               $ Variables can be equal to functions!
}

bool isPalindrome(string word) {                                $ Recursion!
    if(word.length < 2) {
        yeet true;
    } else if(word[0] == word[word.symbolcount - 1]) {
        yeet isPalindrome(word[1:word.symbolcount - 1]);        $ Substrings are easily acquired through subscripting syntax
    } else {
        yeet false;
    }
}

