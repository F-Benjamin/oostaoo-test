import { useEffect, useState, useRef } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import LinearProgress from "@mui/material/LinearProgress";
import DialogTitle from "@mui/material/DialogTitle";
import Card from "./Card/card";
import "./App.scss";

const uniqueElementsArray = [
  {
    type: "amazon",
    image: require(`./Images/amazon.jpg`),
  },
  {
    type: "apple",
    image: require(`./Images/apple.jpg`),
  },
  {
    type: "facebook",
    image: require(`./Images/facebook.jpg`),
  },
  {
    type: "instagram",
    image: require(`./Images/insta.jpg`),
  },
  {
    type: "netflix",
    image: require(`./Images/netflix.jpg`),
  },
  {
    type: "tiktok",
    image: require(`./Images/tiktok.jpg`),
  },
  {
    type: "twitter",
    image: require(`./Images/twitter.jpg`),
  },
  {
    type: "youtube",
    image: require(`./Images/youtube.jpg`),
  },
];
// récupère le tableau, boucle sur l'index et renvoie un nouvelle index modifier pour que les images soit affiché aléatoirement
function shuffleCards(array) {
  const length = array.length;
  for (let i = length; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * i);
    const currentIndex = i - 1;
    const temp = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temp;
  }
  return array;
}
export default function App() {
  const [cards, setCards] = useState(() =>
    shuffleCards(uniqueElementsArray.concat(uniqueElementsArray))
  ); // state de dépars avec uniqueElementsArray x2 et aléatoire
  const [openCards, setOpenCards] = useState([]); // state pour suivre les cartes selectionnés
  const [clearedCards, setClearedCards] = useState({}); // state pour mémoriser les cartes trouvées et les retirées du plateau
  const [shouldDisableAllCards, setShouldDisableAllCards] = useState(false);
  const [moves, setMoves] = useState(0); // compteur de clic
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isStart, setIsStart] = useState(false);
  const timeout = useRef(null); // on utilise useRef pour pourvoir modifier timeout sans influencer le comportement du composant

  // Sécurité pour qu'on ne puisse pas cliqué sur plus de 2 cartes
  const disable = () => {
    setShouldDisableAllCards(true);
  };
  const enable = () => {
    setShouldDisableAllCards(false);
  };

  // surveille l'avancer du jeux en vue d'afficher le msg de victoire
  const checkCompletion = () => {
    // On stock les cartes trouvées dans un objet car plus simple d'utilisation qu'un tableau
    if (
      Object.keys(clearedCards).length === uniqueElementsArray.length ||
      progress === 100
    ) {
      setShowModal(true);
      setIsStart(false);
    }
  };

  // check si les 2 cartes sont du meme type, si oui, elles deviennent inactive
  const evaluate = () => {
    const [first, second] = openCards;
    enable();
    if (cards[first].type === cards[second].type) {
      setClearedCards((prev) => ({ ...prev, [cards[first].type]: true }));
      setOpenCards([]);
      return;
    }
    // Retourne les cartes apres 500ms
    timeout.current = setTimeout(() => {
      setOpenCards([]);
    }, 500);
  };
  const handleCardClick = (index) => {
    if (isStart === false) {
      setIsStart(true);
    }
    // Check qu'il n'y ait bien que 2 cartes selectionnés à la fois
    if (openCards.length === 1) {
      setOpenCards((prev) => [...prev, index]);
      setMoves((moves) => moves + 1);
      disable();
    } else {
      // cancel le timer si 2 cartes sont déja selectionner
      clearTimeout(timeout.current);
      setOpenCards([index]);
    }
  };
  // Surveille si la partie à commencer et si le timer doit etre activé
  useEffect(() => {
    let interval = null;
    if (isStart === true) {
      interval = setInterval(() => {
        setProgress((progress) => progress + 4);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isStart]);

  // Surveille le nombre de cartes sélectionnées
  useEffect(() => {
    let timeout = null;
    if (openCards.length === 2) {
      timeout = setTimeout(evaluate, 500);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [openCards]);

  // Surveille l'avancement de la partie
  useEffect(() => {
    checkCompletion();
  }, [clearedCards, progress]);

  // Comme on utilise un tableau static et qu'on ne supprime rien de ce tableau, on se sert des states openCards et clearedCards
  // pour passer une prop à notre compossant Card pour que la bonne class soit utilisée
  const checkIsFlipped = (index) => {
    return openCards.includes(index);
  };

  const checkIsInactive = (card) => {
    return Boolean(clearedCards[card.type]);
  };

  const handleRestart = () => {
    setClearedCards({});
    setOpenCards([]);
    setShowModal(false);
    setMoves(0);
    setShouldDisableAllCards(false);
    setCards(shuffleCards(uniqueElementsArray.concat(uniqueElementsArray)));
    setProgress(0);
  };
  return (
    <div className="App">
      <header>
        <h3>Memory game</h3>
      </header>
      <div className="container">
        {cards.map((card, index) => {
          return (
            <Card
              key={index}
              card={card}
              index={index}
              isDisabled={shouldDisableAllCards}
              isInactive={checkIsInactive(card)}
              isFlipped={checkIsFlipped(index)}
              onClick={handleCardClick}
            />
          );
        })}
      </div>
      <footer>
        <LinearProgress variant="determinate" value={progress} />
      </footer>
      <Dialog
        open={showModal}
        disablebackdropclick
        disableEscapeKeyDown
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div>
          {progress === 100 ? (
            <DialogTitle id="alert-dialog-title">
              Pas assez rapide !
            </DialogTitle>
          ) : (
            <DialogTitle id="alert-dialog-title">
              Bravo ! Tu as réussis en {moves} coup.
            </DialogTitle>
          )}
        </div>
        <DialogActions>
          <Button onClick={handleRestart} color="primary">
            Restart
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
