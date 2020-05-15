(define-data-var score int 25)

(define-public (get-score)
    (ok (var-get score)))

(define-public (submit-score (newScore int))
    (begin
        (if (> newScore (var-get score)) (update-score newScore) (ok (var-get score)))))

(define-private (update-score (newScore int))
    (begin
        (var-set score newScore)
        (ok (var-get score))))