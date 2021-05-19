$("#postTextarea").keyup(event => {
  let textBox = $(event.target)
  let value = textBox.val().trim()
  let submitButton = $("#submitPostButton")

  //確認按鈕存在
  if (submitButton.length === 0) return alert("No submit button found")
  //確認textbox有輸入
  if (value === "") return submitButton.prop("disabled", true)

  submitButton.prop("disabled", false)
})