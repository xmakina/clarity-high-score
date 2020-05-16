;; Create a map, which will use the principal (wallet) of the player as the key
;; Against the principal key, we will store a name and the best score
(define-map scores ((player principal)) ((name (buff 40)) (score int)))

;; When a new score is submitted, we will compare it to the current global high score
;; We can do this by saving the key of the current high score and looking it up
(define-data-var highScorePrincipal principal 'ST3WCQ6S0DFT7YHF53M8JPKGDS1N1GSSR91677XF1) ;; default is a nonsense wallet address

;; private functions allow us to encapsulate complex functionality behind a function call
;; this makes the rest of our code much easier to read, especially as the number of () grows
(define-private (get-score-for (player principal))
    (default-to 0 (get score (map-get? scores (tuple (player player)))))
)

(define-private (get-name-for (player principal))
    (default-to "nobody" (get name (map-get? scores (tuple (player player)))))
)

;; we need to update the score for the player
;; this is the best place to also update the global high score if appropriate
(define-private (update-result-for (player principal) (playerName (buff 40)) (newScore int))
    (begin 
        ;; set the highScorePrincipal to the player principal if they beat the current high score
        ;; because of how functional programming works, we set the highScorePrincipal to it's current value if it is still the highest score
        (var-set highScorePrincipal (if
            (> newScore (get-score-for (var-get highScorePrincipal)))
            player
            (var-get highScorePrincipal)
        ))

        ;; update the scores table, either adding the new player or updating their existing best score and name
        (map-set scores (tuple (player player)) ((name playerName) (score newScore)))

        ;; now return the players entry in the leaderboard so they can verify everything is saved as expected
        (get-best-for player)
    )
)

;; because we have the steps for getting the score and name as private functions, this function is a lot easier to read
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

;; when the player submits a new score, we check if it beats their existing best
;; if it does, we update the score board, otherwise we just return their current score board entry
(define-public (submit-score (playerName (buff 40)) (newScore int))
    (ok 
        (if
            (> newScore (get-score-for tx-sender))
            (update-result-for tx-sender playerName newScore)
            (get-best-for tx-sender)
        )
    )
)

;; humans like to change names from time to time, so let's add that functionality for completeness
(define-public (change-name (playerName (buff 40)))
    (ok 
        (map-set scores (tuple (player tx-sender)) ((name playerName) (score (get-score-for tx-sender))))
    )
)