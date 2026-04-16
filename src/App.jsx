import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, ChevronDown, Heart, Share2, MoreHorizontal, Music, X, ListMusic, List, Mic } from 'lucide-react';
import { songs } from './data/songs';
import './App.css';

function App() {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [likedSongs, setLikedSongs] = useState({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [playlistTab, setPlaylistTab] = useState('playlist');
  const menuRef = useRef(null);
  
  const audioRef = useRef(null);
  const currentSong = songs[currentSongIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Audio play error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSongIndex]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const toggleLike = useCallback(() => {
    setLikedSongs(prev => ({
      ...prev,
      [currentSong.id]: !prev[currentSong.id]
    }));
  }, [currentSong.id]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: currentSong.title,
      text: `${currentSong.title} - ${currentSong.artist} | Amor Eterno ❤️`,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        setShareFeedback(true);
        setTimeout(() => setShareFeedback(false), 2000);
      }
    } catch {
      console.log('Share cancelled');
    }
  }, [currentSong]);

  const skipToSong = useCallback((index) => {
    setIsSwitching(true);
    setTimeout(() => {
      setCurrentSongIndex(index);
      setIsPlaying(true);
      setTimeout(() => setIsSwitching(false), 100);
    }, 300);
  }, []);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    setCurrentTime(current);
    setDuration(dur || 0);
    setProgress((current / dur) * 100 || 0);
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = seekTime;
    setProgress(Number(e.target.value));
  };

  const skipSong = useCallback((direction) => {
    setIsSwitching(true);
    
    setTimeout(() => {
      let newIndex;
      if (isShuffled) {
        do {
          newIndex = Math.floor(Math.random() * songs.length);
        } while (newIndex === currentSongIndex && songs.length > 1);
      } else {
        newIndex = currentSongIndex + direction;
        if (newIndex < 0) newIndex = songs.length - 1;
        if (newIndex >= songs.length) newIndex = 0;
      }
      setCurrentSongIndex(newIndex);
      setIsPlaying(true);
      
      setTimeout(() => setIsSwitching(false), 100);
    }, 300);
  }, [currentSongIndex, isShuffled]);

  const handleSongEnd = () => {
    if (isRepeating) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      skipSong(1);
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="app-container">
      {/* Dynamic Background */}
      <div 
        className="bg-blur-layer"
        style={{ backgroundImage: `url(${currentSong.coverUrl})` }}
      />
      <div className="bg-gradient-overlay" />
      <div className="bg-noise" />

      {/* Main Content */}
      <div className="content-wrapper">
        
        {/* Mobile Header */}
        <div className="player-header">
          <div className="header-icon">
            <ChevronDown size={22} />
          </div>
          <div className="header-center">
            <span className="header-label">Tocando da Playlist</span>
            <p className="header-title">Amor Eterno ❤️</p>
          </div>
          <div className="header-icon" ref={menuRef}>
            <button 
              className="header-icon-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <MoreHorizontal size={22} />
            </button>
            {isMenuOpen && (
              <div className="dropdown-menu">
                <button onClick={() => { setIsPlaylistOpen(true); setIsMenuOpen(false); }}>
                  <List size={16} />
                  Ver playlist
                </button>
                <button onClick={toggleLike}>
                  <Heart size={16} fill={likedSongs[currentSong.id] ? 'currentColor' : 'none'} />
                  {likedSongs[currentSong.id] ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                </button>
                <button onClick={handleShare}>
                  <Share2 size={16} />
                  {shareFeedback ? 'Copiado!' : 'Compartilhar'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Album Cover */}
        <div className="cover-section">
          <div className="cover-container animate-fade-in-scale">
            <div 
              className="cover-glow"
              style={{ backgroundImage: `url(${currentSong.coverUrl})` }}
            />
            <img 
              src={currentSong.coverUrl} 
              alt={currentSong.title} 
              className={`cover-image ${isSwitching ? 'switching' : ''}`}
            />
          </div>
        </div>

        {/* Controls Section */}
        <div className="controls-section">
          
          {/* Desktop Header */}
          <div className="desktop-header">
            <span className="playlist-label">Tocando da Playlist</span>
            <span className="playlist-name">Amor Eterno ❤️</span>
          </div>

          {/* Song Info */}
          <div className="song-info">
            <div>
              <h1 className="song-title">{currentSong.title}</h1>
              <p className="song-artist">{currentSong.artist}</p>
            </div>
            <button 
              className={`heart-btn ${likedSongs[currentSong.id] ? 'liked' : ''}`}
              onClick={toggleLike}
              title={likedSongs[currentSong.id] ? 'Descurtir' : 'Curtir'}
            >
              <Heart 
                size={26} 
                fill={likedSongs[currentSong.id] ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="progress-section">
            <div className="progress-bar-wrapper">
              <div className="progress-track">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div 
                className="progress-thumb" 
                style={{ left: `${progress}%` }} 
              />
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={progress} 
                onChange={handleSeek}
                className="progress-input"
              />
            </div>
            <div className="progress-times">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Player Controls */}
          <div className="player-controls">
            <button 
              className={`control-btn ${isShuffled ? 'active' : ''}`}
              onClick={() => setIsShuffled(!isShuffled)}
              title="Aleatório"
            >
              <Shuffle size={20} />
            </button>
            <button 
              className="control-btn" 
              onClick={() => skipSong(-1)}
              title="Anterior"
            >
              <SkipBack size={28} fill="currentColor" />
            </button>
            <button 
              className="play-btn"
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pausar' : 'Tocar'}
            >
              {isPlaying ? (
                <Pause size={28} fill="currentColor" />
              ) : (
                <Play size={28} fill="currentColor" style={{ marginLeft: 3 }} />
              )}
            </button>
            <button 
              className="control-btn" 
              onClick={() => skipSong(1)}
              title="Próximo"
            >
              <SkipForward size={28} fill="currentColor" />
            </button>
            <button 
              className={`control-btn ${isRepeating ? 'active' : ''}`}
              onClick={() => setIsRepeating(!isRepeating)}
              title="Repetir"
            >
              <Repeat size={20} />
            </button>
          </div>

          {/* Song Counter */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0 0 10px' }}>
            <div className="song-counter">
              <Music size={12} />
              <span>{currentSongIndex + 1} de {songs.length}</span>
            </div>
          </div>

          {/* Carta (Love Letter) */}
          <div className="carta-section">
            <div 
              className={`carta-card ${isLyricsOpen ? 'carta-open' : ''}`}
              onClick={() => !isLyricsOpen && setIsLyricsOpen(true)}
            >
              {/* Close button (only when open) */}
              {isLyricsOpen && (
                <button 
                  className="carta-close-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLyricsOpen(false);
                  }}
                >
                  <ChevronDown size={20} />
                </button>
              )}

              <div className="carta-header">
                <h3 className="carta-label">
                  {isLyricsOpen ? '💌 Carta para você' : '💌 Carta'}
                </h3>
                {!isLyricsOpen && (
                  <div className="carta-expand-icon">
                    <ChevronDown size={16} style={{ transform: 'rotate(180deg)' }} />
                  </div>
                )}
              </div>
              
              {isLyricsOpen ? (
                <div className="carta-text full animate-slide-up">
                  <p style={{ whiteSpace: 'pre-line' }}>
                    "{currentSong.letter}"
                  </p>
                </div>
              ) : (
                <div className="carta-text preview">
                  <p>{currentSong.letter}</p>
                </div>
              )}
            </div>
          </div>

          {/* Desktop extra actions */}
          <div className="bottom-actions">
            <button className="bottom-action-btn" onClick={handleShare}>
              <Share2 size={14} />
              {shareFeedback ? 'Copiado!' : 'Compartilhar'}
            </button>
            <button className="bottom-action-btn" onClick={() => setIsPlaylistOpen(true)}>
              <ListMusic size={14} />
              Playlist
            </button>
          </div>

        </div>
      </div>

      <audio 
        ref={audioRef}
        src={currentSong.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleSongEnd}
      />

      {isPlaylistOpen && (
        <div className="playlist-overlay" onClick={() => setIsPlaylistOpen(false)}>
          <div className="playlist-panel" onClick={e => e.stopPropagation()}>
            <div className="playlist-header">
              <h2>Amor Eterno ❤️</h2>
              <button className="playlist-close" onClick={() => setIsPlaylistOpen(false)}>
                <X size={22} />
              </button>
            </div>
            
            <div className="playlist-tabs">
              <button 
                className={`playlist-tab ${playlistTab === 'playlist' ? 'active' : ''}`}
                onClick={() => setPlaylistTab('playlist')}
              >
                <ListMusic size={16} />
                Playlist
              </button>
              <button 
                className={`playlist-tab ${playlistTab === 'lyrics' ? 'active' : ''}`}
                onClick={() => setPlaylistTab('lyrics')}
              >
                <Mic size={16} />
                Lyrics
              </button>
            </div>

            {playlistTab === 'playlist' ? (
              <div className="playlist-list">
                {songs.map((song, index) => (
                  <div 
                    key={song.id}
                    className={`playlist-item ${index === currentSongIndex ? 'active' : ''}`}
                    onClick={() => skipToSong(index)}
                  >
                    <div className="playlist-item-cover">
                      <img src={song.coverUrl} alt={song.title} />
                      {index === currentSongIndex && isPlaying && (
                        <div className="playing-indicator">
                          <span></span><span></span><span></span>
                        </div>
                      )}
                    </div>
                    <div className="playlist-item-info">
                      <span className="playlist-item-title">{song.title}</span>
                      <span className="playlist-item-artist">{song.artist}</span>
                    </div>
                    <div className="playlist-item-actions">
                      {likedSongs[song.id] && <Heart size={14} fill="currentColor" className="liked-icon" />}
                      <button className="playlist-play-btn">
                        {index === currentSongIndex && isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="lyrics-container">
                {currentSong.lyrics && currentSong.lyrics.length > 0 ? (
                  <div className="lyrics-content">
                    {currentSong.lyrics.map((line, index) => (
                      <div key={index} className="lyric-line">
                        {line.text}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="lyrics-empty">
                    <p>Lyrics not available for this song</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
