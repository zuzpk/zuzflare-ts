const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

/** Package.json 
 * Replace @zuzjs/ui version to latest from workspace
 * Replace @zuzjs/store version to latest from workspace
*/
const packageJsonPath = path.join(__dirname, "package.json")
const backupPath = path.join(__dirname, "package.json.bak")

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))
fs.writeFileSync(backupPath, JSON.stringify(packageJson, null, 2))

const packages = [
    {
        id: "core",
        name: "@zuzjs/core"
    },
    {
        id: "flare-client",
        name: "@zuzjs/flare"
    },
    {
        id: "hooks",
        name: "@zuzjs/hooks"
    },
    {
        id: "logger",
        name: "@zuzjs/logger"
    },
    {
        id: "store",
        name: "@zuzjs/store"
    },
    {
        id: "ui",
        name: "@zuzjs/ui"
    },

]

for(const pack of packages) {
    const packPath = path.join(__dirname, "..", "..", "packages", pack.id, "package.json")
    const packJson = JSON.parse(fs.readFileSync(packPath, "utf8"))
    packageJson.dependencies[pack.name] = `^${packJson.version}`
}


fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

execSync("git add package.json", { stdio: "inherit" })