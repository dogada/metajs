;; each entity is resolved to undefined and should not raise Exception in writeRaw
(assert-js "(statements (entity test-entity))" "")
