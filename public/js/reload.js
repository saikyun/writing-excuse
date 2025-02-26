const refresh = async () => {
  try {
    const res = await fetch("/refresh")
    const t = await res.text()
    if (t == "true") {
      setTimeout(() => {
        window.location.reload()
      }, 50)
    } else {
      // console.log("not refreshing");
    }
  } catch (e) {
    console.error(e)
  }

  setTimeout(refresh, 100)
}

refresh()
