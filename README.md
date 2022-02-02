# Pandemonium
![logo](https://github.com/ImperatorSmugleaf/pandemonium/blob/c2d094c9efba6ee25a403423dbc0603256def24b/docs/logo.png)

By: Kieran Ahn

# Introduction
Pandemonium is a language designed to be safe, readable, and enjoyable. It is a collection of featuers from JavaScript, Swift, Python, Javam and even one or two of its own. Another possible name was Stirfry, but Pandemonium is a cooler sounding name. It seeks to eliminate the one-billion dollar mistake and hold the programmer to a higher standard of correctness through rigid and rigorous typing. 

# Features
- Strong, static typing
- Lambda expressions
- Mutable lists
- Distinct functions and processes
- String interpolation
- Multiline strings
- Classes (reference types) and structs (value types)
- Set operators (e.g., subset, proper subset)
- Easy string slicing
- Reference equality and deep equality operators

# Types
- string -> string
- boolean -> bool
- number -> num
- list -> (some type)[]

# Variable Declaration
Variables can either be read-only or mutable, and variables cannot be declared without a binding. Variable naming convention is upperCamelCase. Variable names can only contain an an alphanumeric symbol or an underscore.
```
set updog: string = "What's updog?";              $ Read-only
now favouriteHPMovie: num = 5;                    $ Mutable
set _doesThisStartWithAnUnderscore: bool = true;  
now #swag: string = "swag";                       $ Syntax error
```

# Operators
TODO: Add associativity
| Operator | Purpose |
| -------- | ---------- |
|   =      | Assignment |
|   ==     | Deep Equality |
|   !=     | Not equal to |
|   is     | Reference Equality |
|   in     | Membership checking for string or list|
|   <      | Less than |
|   <=     | Less than or equal to |
|   >      | Greater than |
|   >=     | Greater than or equal to |
|   !      | Unary negation |
|   +      | Addition |
|   -      | Subtraction |
|   *      | Multiplication |
|   /      | Division |
|   ^      | Exponentiation |
|   //     | Floor division |
|   %      | Modulus |
|   C<     | Proper subset |
|   C=     | Subset |
|   <-     | Unpacking/destructuring |
|   ->     | Lambda arrow |
|   and    | logical and |
|   or     | logical or |
|   ++     | Unary increment |
|   --     | Unary decrement |
|   +=     | Addition assignment |
|   -=     | Subtraction assignment |

# Keywords
|  Keyword  | Meaning |
| --------- | ------- |
|   now     | Declare mutable variable |
|   set     | Declare read-only variable |
|   if      | Begin if statement |
|   else    | Introduce else or else if statement |
|   while   | Begin while loop |
|   for     | Begin for loop |
|   yeet    | Return equivalent |
|   nope    | Breaks out of loop |
|   public  | Sections off visible attributes |
|   private | Sections off non-visible attributes |

# Functions and Procedures
Functions are blocks of code which always return a value. Procedures are blocks of code which do not return a value. Thus, by differentiating the two, we eliminate the existence of a runtime null.
```
num timesThree(num x) {
    yeet x * 3;
}
  
proc sayHello() {
    print("Hello!");
}
```
Lambda expressions are functions, as they must always return a value. Since they can only be used in expressions, their function signatures do not need to be declared explicitly, since they are implied to match that of the variables to which they are being bound.
```
now x: num = 0;
now xSquared: num = () -> {x ^ 2};    
$ Variables bound to lambda expressions containing variables must always be mutable, since they may change over time.
```

# Control Flow
Control flow in pandemonium is similar to other languages, with no real surprises.
```
set dogsAreGood: bool = true;
now isRaining: bool = false;

if(dogsAreGood and isRaining) {
  print("Good doggos don't track mud back in the house");
} else if (dogsAreGood and !isRaining) {
  print("Good doggos get to play outside");
} else {
  print("If doggos aren't good, the world isn't real.");
}

set oneThroughFive: num[] = [1, 2, 3, 4, 5]
for(x in oneThroughFive) {
  print(x);
}

for(i = 5; i > 0; i--) {
  print(i);
}

now loops: num = 0;
while(dogsAreGood) {
  print("I like dogs :)");
  loops++;
  
  if(loops > 100) {
    nope;
  }
}
```

# Classes and Structs
Classes are reference types and structs are value types. Both can have initializers, fields, and methods. Struct attributes are public by default, and class attributes are private by default. 
```
class Circle {
  set this.area: num = this.radius^2 * 3.14;
  
  public:
  proc init(num radius) {
    set this.radius: num = radius;
  }
  
  num getArea() {
    yeet this.area;
  }
}

struct Square {
  proc init(num sideLength) {
  set this.sideLength: num = sideLength;
  }
  
  set this.area: num = this.sideLength^2;
  
  proc speak() {
    print("I'm a square!");
  }
}
```

# Strings
Pandemonium has numerous quality of life features for string usage.
```
set theFirstSentence: string = `According to all known laws of aviation,        $ Multiline strings begin with backticks
                                there is no way a bee should be able to fly.`;
print("bee" in theFirstSentence);                           $ true
set theFirstWord: string = theFirstSentence[0:8];           $ string slicing through subscripting is inclusive on both ends
set theFirstLetter: string = theFirstWord[0];               $ string indexing through subscripting as well
set firstSentenceLength = theFirstSentence.symbolcount  

set sleepHours: num = 8;
print("I got #{sleepHours} hours of sleep last night.");    $ Easy, swiftlike string interpolation
```

# Lists
Lists have a few built-in attributes and methods to make working with them simple and intuitive. Lists can be mutable or read-only, depending on how they are declared. 
```
now myNumbers: num[] = [];                    $ Empty lists can be initialized
myNumbers.add(1);                             $ [1]
myNumbers.preadd(0);                          $ [0, 1]
myNumbers.insertAt(1, 0.5);                   $ [0, 0.5, 1]

now oneToThree: num[] = [<-myNumbers, 2, 3]   $ [0, 0.5, 1, 2, 3]
oneToThree.removeAt(1)                        $ [0, 1, 2, 3]

print(myNumbers.pop());                       $ 1
myNumbers.clear()                             $ []


set theRealTreasure: string[] = ["The", "friends", "we", "made", "along", "the", "way"];
theRealTreasure.clear()                 $ Error: cannot modify an immutable list.
```
