plugins {
    id("org.jetbrains.kotlin.jvm") version "2.2.0"
    id("org.jetbrains.intellij.platform") version "2.16.0"
}

group = "dev.flintengine"
version = "0.2.0"

kotlin {
    jvmToolchain(21)
}

repositories {
    mavenCentral()
    intellijPlatform {
        defaultRepositories()
    }
}

dependencies {
    intellijPlatform {
        intellijIdea("2026.1.5")
        bundledPlugin("org.jetbrains.plugins.textmate")
    }
}

intellijPlatform {
    pluginConfiguration {
        ideaVersion {
            sinceBuild = "261"
        }
    }
}

tasks.prepareSandbox {
    from("../server/out") {
        include("**/*.js")
        into(pluginName.map { "$it/server" })
    }
    from("..") {
        include("package.json", "language-configuration.json", "syntaxes/**")
        into(pluginName.map { "$it/textmate" })
    }
}