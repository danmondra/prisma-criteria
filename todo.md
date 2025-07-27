- Should return by default AND: [conditions] because AND: [] returns all items

- Should return an array of conditions, instead of an object.
  -> { AND: ..., OR: ... } -> [{AND: ...}, { OR: ... }]

- First filter doesn't need a logic operator it should be automatically an "AND"
