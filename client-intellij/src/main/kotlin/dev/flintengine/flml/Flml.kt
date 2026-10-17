package dev.flintengine.flml

import com.intellij.execution.configurations.GeneralCommandLine
import com.intellij.ide.FileIconProvider
import com.intellij.ide.plugins.PluginManager
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.IconLoader
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.platform.lsp.api.LspIntegrationProvider
import com.intellij.platform.lsp.api.ProjectWideLspClientDescriptor
import org.jetbrains.plugins.textmate.api.TextMateBundleProvider
import java.nio.file.Path
import javax.swing.Icon

private const val FLML_EXTENSION = "flml"

private fun isFlml(file: VirtualFile) = file.extension == FLML_EXTENSION

private fun pluginDir(): Path =
    PluginManager.getPluginByClass(FlmlIcons::class.java)!!.pluginPath

class FlmlLspIntegrationProvider : LspIntegrationProvider {
    override fun fileOpened(
        project: Project,
        file: VirtualFile,
        clientStarter: LspIntegrationProvider.LspClientStarter,
    ) {
        if (isFlml(file)) {
            clientStarter.ensureClientStarted(FlmlLspClientDescriptor(project))
        }
    }
}

private class FlmlLspClientDescriptor(project: Project) :
    ProjectWideLspClientDescriptor(project, "FLML") {

    override fun isSupportedFile(file: VirtualFile) = isFlml(file)

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
        if (isFlml(file)) FlmlIcons.FILE else null
}