package dev.flintengine.flml

import com.intellij.execution.configurations.GeneralCommandLine
import com.intellij.ide.plugins.PluginManagerCore
import com.intellij.openapi.extensions.PluginId
import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.platform.lsp.api.LspServerSupportProvider
import com.intellij.platform.lsp.api.ProjectWideLspServerDescriptor
import org.jetbrains.plugins.textmate.api.TextMateBundleProvider
import java.nio.file.Path
import com.intellij.ide.FileIconProvider
import com.intellij.openapi.util.IconLoader
import javax.swing.Icon

private fun pluginDir(): Path =
    PluginManagerCore.getPlugin(PluginId.getId("dev.flintengine.flml"))!!.pluginPath

class FlmlLspServerSupportProvider : LspServerSupportProvider {
    override fun fileOpened(
        project: Project,
        file: VirtualFile,
        serverStarter: LspServerSupportProvider.LspServerStarter,
    ) {
        if (file.extension == "flml") {
            serverStarter.ensureServerStarted(FlmlLspServerDescriptor(project))
        }
    }
}

private class FlmlLspServerDescriptor(project: Project) :
    ProjectWideLspServerDescriptor(project, "FLML") {

    override fun isSupportedFile(file: VirtualFile) = file.extension == "flml"

    override fun createCommandLine() = GeneralCommandLine(
        "node",
        pluginDir().resolve("server/server.js").toString(),
        "--stdio",
    )
}

class FlmlTextMateBundleProvider : TextMateBundleProvider {
    override fun getBundles() = listOf(
        TextMateBundleProvider.PluginBundle("FLML", pluginDir().resolve("textmate"))
    )
}

object FlmlIcons {
    @JvmField
    val FILE: Icon = IconLoader.getIcon("/icons/flml.svg", FlmlIcons::class.java)
}

class FlmlFileIconProvider : FileIconProvider {
    override fun getIcon(file: VirtualFile, flags: Int, project: Project?): Icon? =
        if (file.extension == "flml") FlmlIcons.FILE else null
}