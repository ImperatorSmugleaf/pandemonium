$ A preview of classes, structs, and equality operators!

proc main(string[] args) {
    set fido: Dog = Dog("Fido", "Yellow");
    set fidoVariant: Dog = fido                         $ Structs are passed by copy
    set fidoTheSecond: Dog = Dog("Fido", "Yellow");
    
    set felix: Cat = new Cat("Felix", "Black");
    set felixClone: Cat = felix;                        $ Classes are passed by reference
    set felixTwo: Cat = new Cat("Felix", "Black");
    
    fido.bark();
    felix.meow();
    felix.wake();
    felix.wake();
    felix.putToBed();

    print(fido == fidoTheSecond);                       $ True
    print(fido == fidoVariant);                         $ True
    print(fido is fidoTheSecond);                       $ False
    print(fidoVariant is fido);                         $ False
    print(felix == felixTwo);                           $ True
    print(felix is felixTwo);                           $ False
    print(felix is felixClone);                         $ True
    print(felix == felixClone);                         $ True
}


struct Dog {
    private:                                            $ Struct fields are public by default
    set paws: num = 4;
    now tailWagging: bool = false;
    
    public:
    init(string name, string color) {                    
        now this.name: string = name;
        set this.color: string = color;
    }
    
    proc bark() {
        print("Woof");
    }

}

class Cat {
    set paws: num = 4;                                  $ Class fields are private by default
    now isSleeping: bool = true;
    
    public:
    init(string name, string color) {
        now this.name: string = name;
        set this.color: string = color;
    }

    proc meow() { 
        print("Meow");
    }
    
    proc wake() {
        if(this.isSleeping) {
            isSleeping = false;
            print("#{this.name} is now awake!");
        } else {
            print("#{this.name} is already awake!");
        }
    
    }
    
    proc putToBed() {
        if(!this.isSleeping) {
            isSleeping = true;
            print("#{this.name} is now asleep!");
        } else {
            print("#{this.name} is already asleep!");
        }
        
    }

}




