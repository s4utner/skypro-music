import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import * as S from './AudioPlayerStyles.js'
import { useState, useRef } from 'react'
import {
    convertSecondsToMinutesAndSeconds,
    alertFunctionIsNotReady,
} from '../../helpers.js'
import { useSelector, useDispatch } from 'react-redux'
import {
    playNextTrack,
    playPrevTrack,
    setIsShuffled,
    setTracks,
} from '../../store/slices.js'
import {
    setLike,
    refreshToken,
    getAllTracks,
    getFavTracks,
    getPlaylist,
    removeLike,
} from '../../Api.js'

export const AudioPlayer = ({
    isPlayerVisible,
    isLoading,
    audioRef,
    togglePlay,
    isPlaying,
    playlist,
    setLoadingTracksError,
    setIsLoading,
    setIsPlaying,
}) => {
    const [isLooped, setIsLooped] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [currentVolume, setCurrentVolume] = useState(0.5)
    const activeTrack = useSelector((state) => state.tracks.activeTrack)
    const categoryId = useSelector((state) => state.tracks.categoryId)
    const isShuffled = useSelector((state) => state.tracks.isShuffled)
    const dispatch = useDispatch()
    const progressBarRef = useRef(null)
    const volumeBarRef = useRef(null)
    const duration = audioRef.current ? audioRef.current.duration : 0

    const handleLoop = () => {
        audioRef.current.loop = true
        setIsLooped(true)
    }

    const handleUnloop = () => {
        audioRef.current.loop = false
        setIsLooped(false)
    }

    const toggleLoop = isLooped ? handleUnloop : handleLoop

    let isLiked = activeTrack?.stared_user?.some(
        ({ username }) => username === JSON.parse(localStorage.getItem('user')),
    )

    if (!activeTrack.stared_user) {
        isLiked = true
    }

    async function handleLike(id) {
        let response = await setLike(id)

        if (response.status === 401) {
            const tokensResponse = await refreshToken()
            const tokens = await tokensResponse.json()
            localStorage.setItem('accessToken', tokens.access)
            response = await setLike(id)
        } else if (response.status !== 200) {
            console.log('Произошла ошибка')
        }

        if (playlist === 'fav') {
            const tracksResponse = await getFavTracks()
            const tracks = await tracksResponse.json()
            dispatch(setTracks({ tracks }))
            setLoadingTracksError('')
            setIsLoading(false)
        } else if (playlist === 'main') {
            const tracks = await getAllTracks()
            dispatch(setTracks({ tracks }))
            setLoadingTracksError('')
            setIsLoading(false)
        } else {
            const tracks = await getPlaylist(categoryId)
            dispatch(setTracks({ tracks }))
            setLoadingTracksError('')
            setIsLoading(false)
        }
    }

    async function handleRemoveLike(id) {
        let response = await removeLike(id)

        if (response.status === 401) {
            const tokensResponse = await refreshToken()
            const tokens = await tokensResponse.json()
            localStorage.setItem('accessToken', tokens.access)
            response = await removeLike(id)
        } else if (response.status !== 200) {
            console.log('Произошла ошибка')
        }

        if (playlist === 'fav') {
            const tracksResponse = await getFavTracks()
            const tracks = await tracksResponse.json()
            dispatch(setTracks({ tracks }))
            setLoadingTracksError('')
            setIsLoading(false)
        } else if (playlist === 'main') {
            const tracks = await getAllTracks()
            dispatch(setTracks({ tracks }))
            setLoadingTracksError('')
            setIsLoading(false)
        } else {
            const tracks = await getPlaylist(categoryId)
            dispatch(setTracks({ tracks }))
            setLoadingTracksError('')
            setIsLoading(false)
        }
    }

    const onCanPlayThrough = () => {
        audioRef.current.play()
        setIsPlaying(true)
    }

    return (
        isPlayerVisible && (
            <>
                <audio
                    controls
                    src={activeTrack ? activeTrack.track_file : ''}
                    ref={audioRef}
                    onEnded={() => dispatch(playNextTrack())}
                    onCanPlayThrough={() => onCanPlayThrough()}
                    onTimeUpdate={() => {
                        setCurrentTime(audioRef.current.currentTime)
                    }}
                ></audio>
                {duration && (
                    <S.TrackTime>
                        {convertSecondsToMinutesAndSeconds(currentTime) +
                            ' ' +
                            '/' +
                            ' ' +
                            convertSecondsToMinutesAndSeconds(duration)}
                    </S.TrackTime>
                )}
                <S.Bar>
                    <S.BarContent>
                        <S.ProgressInput
                            ref={progressBarRef}
                            type="range"
                            min={0}
                            max={
                                !isNaN(audioRef?.current?.duration)
                                    ? audioRef.current.duration
                                    : 0
                            }
                            value={currentTime}
                            step={0.01}
                            onChange={() => {
                                setCurrentTime(progressBarRef.current.value)
                                audioRef.current.currentTime =
                                    progressBarRef.current.value
                            }}
                            $color="#ff0000"
                        />
                        <S.BarPlayerBlock>
                            <S.BarPlayer>
                                <S.PlayerControls>
                                    <S.PlayerButtonPrev>
                                        <S.PlayerButtonPrevSvg
                                            alt="prev"
                                            onClick={() =>
                                                dispatch(playPrevTrack())
                                            }
                                        >
                                            <use xlinkHref="/img/icon/sprite.svg#icon-prev"></use>
                                        </S.PlayerButtonPrevSvg>
                                    </S.PlayerButtonPrev>
                                    <S.PlayerButtonPlay>
                                        <S.PlayerButtonPlaySvg
                                            alt="play"
                                            onClick={togglePlay}
                                        >
                                            {isPlaying ? (
                                                <use xlinkHref="/img/icon/sprite.svg#icon-pause"></use>
                                            ) : (
                                                <use xlinkHref="/img/icon/sprite.svg#icon-play"></use>
                                            )}
                                        </S.PlayerButtonPlaySvg>
                                    </S.PlayerButtonPlay>
                                    <S.PlayerButtonNext>
                                        <S.PlayerButtonNextSvg
                                            alt="next"
                                            onClick={() =>
                                                dispatch(playNextTrack())
                                            }
                                        >
                                            <use xlinkHref="/img/icon/sprite.svg#icon-next"></use>
                                        </S.PlayerButtonNextSvg>
                                    </S.PlayerButtonNext>
                                    <S.PlayerButtonRepeat>
                                        <S.PlayerButtonRepeatSvg
                                            alt="repeat"
                                            $islooped={isLooped}
                                            onClick={toggleLoop}
                                        >
                                            <use xlinkHref="/img/icon/sprite.svg#icon-repeat"></use>
                                        </S.PlayerButtonRepeatSvg>
                                    </S.PlayerButtonRepeat>
                                    <S.PlayerButtonShuffle>
                                        <S.PlayerButtonShuffleSvg
                                            alt="shuffle"
                                            $isshuffled={isShuffled}
                                            onClick={() => {
                                                dispatch(setIsShuffled())
                                            }}
                                        >
                                            <use xlinkHref="/img/icon/sprite.svg#icon-shuffle"></use>
                                        </S.PlayerButtonShuffleSvg>
                                    </S.PlayerButtonShuffle>
                                </S.PlayerControls>

                                <S.PlayerTrackPlay>
                                    <S.TrackPlayContain>
                                        <S.TrackPlayImage>
                                            {isLoading ? (
                                                <Skeleton
                                                    width={55}
                                                    height={55}
                                                    baseColor="#202020"
                                                    highlightColor="#444"
                                                />
                                            ) : (
                                                <S.TrackPlaySvg alt="music">
                                                    {activeTrack ? (
                                                        activeTrack.logo
                                                    ) : (
                                                        <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
                                                    )}
                                                </S.TrackPlaySvg>
                                            )}
                                        </S.TrackPlayImage>
                                        <S.TrackPlayAuthor>
                                            {isLoading ? (
                                                <Skeleton
                                                    width={90}
                                                    baseColor="#202020"
                                                    highlightColor="#444"
                                                />
                                            ) : (
                                                <S.TrackPlayAuthorLink href="http://">
                                                    {activeTrack.name}
                                                </S.TrackPlayAuthorLink>
                                            )}
                                        </S.TrackPlayAuthor>
                                        <S.TrackPlayAlbum>
                                            {isLoading ? (
                                                <Skeleton
                                                    width={90}
                                                    baseColor="#202020"
                                                    highlightColor="#444"
                                                />
                                            ) : (
                                                <S.TrackPlayAlbumLink href="http://">
                                                    {activeTrack.author}
                                                </S.TrackPlayAlbumLink>
                                            )}
                                        </S.TrackPlayAlbum>
                                    </S.TrackPlayContain>
                                    <S.TrackPlayLikeDis>
                                        <S.TrackPlayLike>
                                            <S.LikeButton
                                                alt="like"
                                                $isLiked={isLiked}
                                                onClick={(event) => {
                                                    event.stopPropagation()
                                                    handleLike(activeTrack.id)
                                                }}
                                            >
                                                <use xlinkHref="/img/icon/sprite.svg#icon-like"></use>
                                            </S.LikeButton>
                                        </S.TrackPlayLike>
                                        <S.TrackPlayDislike>
                                            <S.TrackPlayDislikeSvg
                                                alt="dislike"
                                                onClick={(event) => {
                                                    event.stopPropagation()
                                                    handleRemoveLike(
                                                        activeTrack.id,
                                                    )
                                                }}
                                            >
                                                <use xlinkHref="/img/icon/sprite.svg#icon-dislike"></use>
                                            </S.TrackPlayDislikeSvg>
                                        </S.TrackPlayDislike>
                                    </S.TrackPlayLikeDis>
                                </S.PlayerTrackPlay>
                            </S.BarPlayer>
                            <S.BarVolumeBlock>
                                <S.VolumeContent>
                                    <S.VolumeImage>
                                        <S.VolumeSvg
                                            alt="volume"
                                            onClick={alertFunctionIsNotReady}
                                        >
                                            <use xlinkHref="/img/icon/sprite.svg#icon-volume"></use>
                                        </S.VolumeSvg>
                                    </S.VolumeImage>
                                    <S.VolumeProgress>
                                        <S.VolumeProgressLine
                                            type="range"
                                            name="range"
                                            ref={volumeBarRef}
                                            value={currentVolume}
                                            min={0}
                                            max={1}
                                            step={0.01}
                                            onChange={() => {
                                                setCurrentVolume(
                                                    audioRef.current.volume,
                                                )
                                                audioRef.current.volume =
                                                    volumeBarRef.current.value
                                            }}
                                        />
                                    </S.VolumeProgress>
                                </S.VolumeContent>
                            </S.BarVolumeBlock>
                        </S.BarPlayerBlock>
                    </S.BarContent>
                </S.Bar>
            </>
        )
    )
}
