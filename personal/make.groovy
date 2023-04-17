import java.util.Properties

def templateFileName = "personalChatGPTTemplate.html"

def templateText = new File(templateFileName).text

def apikey = new File(System.getProperty("user.home") + "/.openaiapi").text.trim()

new File(".").eachFileMatch(~/\w+\.properties/) { propertiesFile ->
    def targetFileName = propertiesFile.name - ".properties" + ".html"
    targetFileName = targetFileName.substring(0, targetFileName.lastIndexOf(".")) + ".html"
    def targetText = templateText

    // continue with next file if the .html file is newer than either the .properties file or the template
//    if (new File(targetFileName).lastModified() > propertiesFile.lastModified() &&
//        new File(targetFileName).lastModified() > new File(templateFileName).lastModified()) {
//        println("Skipping $targetFileName")
//        return
//    }

    println("Processing $targetFileName")

    Properties properties = new Properties()
    properties.load(new FileInputStream(propertiesFile))

    properties.each { key, value ->
        if (value == 'OWNKEY') {
            value = apikey
        }
        // println("Replacing $key with $value")
        targetText = targetText.replaceAll(key, value)
    }

    new File(targetFileName).write(targetText)
}
