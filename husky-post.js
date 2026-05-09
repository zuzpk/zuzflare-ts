const fs = require("fs")
const path = require("path")

const packageJsonPath = path.join(__dirname, "package.json")
const backupPath = path.join(__dirname, "package.json.bak")

if ( fs.existsSync(backupPath) ) {
    
    const originalPackageJson = JSON.parse(fs.readFileSync(backupPath, "utf8"))
    const updatedPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))

    originalPackageJson.version = updatedPackageJson.version

    fs.writeFileSync(packageJsonPath, JSON.stringify(originalPackageJson, null, 2))

    fs.unlinkSync(backupPath)

}