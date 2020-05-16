(define-map scores ((player principal)) ((name (buff 40)) (score int))) ;; A list of everyone's best score
(define-data-var highScorePrincipal principal 'ST3WCQ6S0DFT7YHF53M8JPKGDS1N1GSSR91677XF1)   ;;The principal of the best score
;; We store the current high score, because that is easier than sorting the map every time a new player submits a score

(define-private (get-score-for (player principal))
    (default-to 0 (get score (map-get? scores (tuple (player player)))))
)

(define-private (get-name-for (player principal))
    (default-to "nobody" (get name (map-get? scores (tuple (player player)))))
)

(define-private (update-result-for (player principal) (playerName (buff 40)) (newScore int))
    (begin 
        (var-set highScorePrincipal (if
            (> newScore (get-score-for (var-get highScorePrincipal)))
            player
            (var-get highScorePrincipal)
        ))
        (map-set scores (tuple (player player)) ((name playerName) (score newScore)))
        (get-best-for player)
    )
)

(define-public (get-best-for (player principal))
    (ok (tuple
        (score (get-score-for player))
        (name (get-name-for player))
    ))
)

(define-public (get-high-score)
    (begin 
        (ok (get-best-for (var-get highScorePrincipal)))
    )
)

(define-public (submit-score (playerName (buff 40)) (newScore int))
    (ok 
        (if
            (> newScore (get-score-for tx-sender))
            (update-result-for tx-sender playerName newScore)
            (get-best-for tx-sender)
        )
    )
)
