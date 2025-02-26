module.exports = (html) => /*html*/ `
<!DOCTYPE html>
<html class="dark">
<head><title>Writing Excuse</title>
<link rel="stylesheet" type="text/css" href="css/paper.css" />
<script src="js/reload.js"></script>
<script src="https://unpkg.com/htmx.org@2.0.4"></script>
<script src="https://unpkg.com/htmx-ext-json-enc@2.0.1/json-enc.js"></script>
<style>
html.dark body {
    background: #41403e;
}
</style>
</head>
<body>
<div class="row site">
<div class="container">
<div class="paper">
${html}
</div>
</div>
</div>
</body>
</html>
`
