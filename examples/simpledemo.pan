$ A brief introduction to basic pandemonium features, demonstrated through the pythagorean theorem!

proc main ([string] args) {
    if(args.length != 2) {
        skrrt("This program requires two numbers as input.");       $ Print something to the console and abort immediately
    }
    set aSquared: num = square(num(args[0]));                       $ Constant variables are bound with "set", and can be declared in the same line. Also, type casting!
    set bSquared: num = () [args] -> {num(args[1]) * num(args[1])}; $ We've got lambdas!
    now cSquared: num = aSquared + bSquared;                        $ Mutable variables are bound with "now"
    printHypoteneuse(aSquared, bSquared, cSquared);
}


num square(num toSquare) {                                          $ Functions always return values
    yeet toSquare^2;                                                $ Using "yeet" as the "return" equivalent is just really funny to me
}

proc printHypoteneuse(num aSquared, num bSquared, num cSquared) {   $ Procedures do not return values
    set c: num = cSquared^(1/2);
    set mathSummary: string = `#{aSquared} + #{bSquared} = #{cSquared}   
    Therefore, the length of the hypoteneuse is #{c}.`;             $ String interpolation and multiline strings!
    
    print(mathSummary);
}