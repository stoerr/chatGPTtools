// read all *.template.txt files in the current directory and write JSON files in ChatML format for ChatGPT chat API
// .template.txt format is as follows: the parts (several lines each) are separated by a line with only dashes like "------"
// The first part is the system message, then alternating a user message and a assistant message
// We write a JSON file like
// [ { "role": "system", "message" : "part 1" }, { "role": "user", "message" : "part 2" }, { "role": "assistant", "message" : "part 3" }, { "role": "user", "message" : "part 4" } ... ]

new File(".").eachFileMatch(~/\w+\.template.txt/) { templatetxt ->
    def targetFileName = templatetxt.name - ".template.txt" + ".json"
    println("Processing $targetFileName")

    def targetText = "[\n"
    def lines = templatetxt.readLines()
    // split the lines into parts. Each part can be several lines; if the line is only dashes, it is the separator
    def parts = []
    def part = []
    lines.each { line ->
        // if the line is only any number of dashes surrounded by whitespace, we have a new part
        if (line =~ /^\s*----+\s*$/) {
            parts.add(part.join("\\n"))
            part = []
        } else {
            part.add(line)
        }
    }
    if (part) {
        parts.add(part.join("\\n"))
    }

    // now we have the parts, we can write the JSON
    parts.eachWithIndex { thepartraw, index ->
        thepart = thepartraw.replaceAll('"', '\\\\"');
        if (index == 0) {
            targetText += "{ \"role\": \"system\", \"content\" : \"$thepart\" }"
        } else if (index % 2 == 1) {
            targetText += "{ \"role\": \"user\", \"content\" : \"$thepart\" }"
        } else {
            targetText += "{ \"role\": \"assistant\", \"content\" : \"$thepart\" }"
        }
        targetText += ",\n"
    }

    targetText = targetText.substring(0, targetText.length() - 2) + "\n]"

    new File(targetFileName).write(targetText)
}
