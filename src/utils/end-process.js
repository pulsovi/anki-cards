function endProcess(subprocess) {
  if (subprocess.exitCode !== null)
    return Promise.resolve(subprocess.exitCode);

  return new Promise(resolve => {
    subprocess.on("close", () => resolve(subprocess.exitCode));
  });
}

module.exports = endProcess;
