(define-map scores ((player principal)) ((name (buff 40)) (score int))) ;; A list of everyone's best score
(define-data-var highScorePrincipal principal 'ST3WCQ6S0DFT7YHF53M8JPKGDS1N1GSSR91677XF1)   ;;The principal of the best score
;; We need to store the best score, because that is easier than sorting the map every time a new player submits a score

(define-public (get-high-score)
    (begin 
        (ok 
            (tuple
                (score (default-to 0 (get score (map-get? scores (tuple (player (var-get highScorePrincipal)))))))
                (name (default-to "nobody" (get name (map-get? scores (tuple (player (var-get highScorePrincipal)))))))
            )
        )
    )
)


;; (map-insert scores (tuple (player 'ST3WCQ6S0DFT7YHF53M8JPKGDS1N1GSSR91677XF1)) ((name "nobody") (score 0)))